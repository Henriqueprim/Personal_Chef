
async function criarTabelas(db) { 
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tb_ingredient (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS tb_recipe (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        rendimento TEXT,
        descricao TEXT,
        path_imagem TEXT -- Coluna para o nome do arquivo da imagem
      );

      CREATE TABLE IF NOT EXISTS tb_recipe_ingredient (
        id_recipe INTEGER NOT NULL,
        id_ingredient INTEGER NOT NULL,
        qtd_ingrediente REAL NOT NULL,
        PRIMARY KEY (id_recipe, id_ingredient),
        FOREIGN KEY (id_recipe) REFERENCES tb_recipe(id),
        FOREIGN KEY (id_ingredient) REFERENCES tb_ingredient(id)
      );

      CREATE TABLE IF NOT EXISTS tb_user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        senha TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefone TEXT,
        endereco TEXT
      );

      CREATE TABLE IF NOT EXISTS tb_order (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_user INTEGER NOT NULL,
        order_date TEXT NOT NULL,
        FOREIGN KEY (id_user) REFERENCES tb_user(id)
      );

      CREATE TABLE IF NOT EXISTS tb_order_recipe (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_order INTEGER NOT NULL,
        id_recipe INTEGER NOT NULL,
        multiplicador REAL NOT NULL,
        FOREIGN KEY (id_order) REFERENCES tb_order(id),
        FOREIGN KEY (id_recipe) REFERENCES tb_recipe(id)
      );
    `);
  });
}

async function popularBanco(db) {
  await db.withTransactionAsync(async () => {
    const ingredientes = [
      'arroz', 'alho', 'óleo', 'cebola', 'feijão carioca', 'carne moída',
      'peito de frango', 'azeite', 'macarrão', 'leite condensado', 'chocolate em pó',
      'manteiga', 'cenoura', 'açúcar', 'farinha de trigo', 'ovos', 'leite', 'sal'
    ];

    for (const nome of ingredientes) {
      await db.runAsync(`INSERT OR IGNORE INTO tb_ingredient (nome) VALUES (?);`, [nome]);
    }

    const receitas = [
      {
        nome: 'Arroz temperado', rendimento: '4 porções', descricao: 'Arroz branco temperado com alho refogado.',
        path_imagem: 'arroz.png',
        ingredientes: [['arroz', 400], ['alho', 10], ['óleo', 20]]
      },
      {
        nome: 'Feijão caseiro', rendimento: '6 porções', descricao: 'Feijão cozido com tempero tradicional.',
        path_imagem: 'feijao.webp',
        ingredientes: [['feijão carioca', 500], ['cebola', 50], ['alho', 10]]
      },
      {
        nome: 'Carne moída refogada', rendimento: '4 porções', descricao: 'Carne moída refogada com cebola e alho.',
        path_imagem: 'carne.webp',
        ingredientes: [['carne moída', 500], ['cebola', 50], ['alho', 10]]
      },
      {
        nome: 'Frango grelhado', rendimento: '4 porções', descricao: 'Peito de frango grelhado com azeite e sal.',
        path_imagem: 'frango.png',
        ingredientes: [['peito de frango', 600], ['sal', 5], ['azeite', 20]]
      },
      {
        nome: 'Macarrão ao alho e óleo', rendimento: '5 porções', descricao: 'Macarrão simples com alho dourado no óleo.',
        path_imagem: 'macarrao.png',
        ingredientes: [['macarrão', 500], ['alho', 15], ['óleo', 30]]
      },
      {
        nome: 'Brigadeiro', rendimento: '20 unidades', descricao: 'Docinho clássico de festa.',
        path_imagem: 'brigadeiro.png',
        ingredientes: [['leite condensado', 395], ['chocolate em pó', 30], ['manteiga', 10]]
      },
      {
        nome: 'Bolo de cenoura', rendimento: '1 bolo médio', descricao: 'Bolo de cenoura com cobertura de chocolate.',
        path_imagem: 'bolo_cenoura.webp',
        ingredientes: [['cenoura', 300], ['açúcar', 200], ['farinha de trigo', 250], ['ovos', 3]]
      },
      {
        nome: 'Pudim de leite', rendimento: '1 forma média', descricao: 'Pudim tradicional com calda de açúcar.',
        path_imagem: 'pudim.png',
        ingredientes: [['leite condensado', 395], ['leite', 395], ['ovos', 3]]
      }
    ];

    for (const r of receitas) {
      const result = await db.runAsync(
        `INSERT OR IGNORE INTO tb_recipe (nome, rendimento, descricao, path_imagem) VALUES (?, ?, ?, ?);`,
        [r.nome, r.rendimento, r.descricao, r.path_imagem]
      );

      let recipeId = result.lastInsertRowId;
      if (!recipeId) {
        const existingRecipe = await db.getFirstAsync(`SELECT id FROM tb_recipe WHERE nome = ?;`, [r.nome]);
        if (existingRecipe) {
          recipeId = existingRecipe.id;
        }
      }

      if (recipeId) {
        for (const [nomeIng, qtd] of r.ingredientes) {
          const rows = await db.getAllAsync(
            `SELECT id FROM tb_ingredient WHERE nome = ?;`,
            [nomeIng]
          );
          if (rows.length > 0) {
            const ingId = rows[0].id;
            await db.runAsync(`
              INSERT OR IGNORE INTO tb_recipe_ingredient (id_recipe, id_ingredient, qtd_ingrediente)
              VALUES (?, ?, ?);`,
              [recipeId, ingId, qtd]
            );
          }
        }
      }
    }
  });
}

async function gerarListaDeCompras(db, idPedido) {
  const rows = await db.getAllAsync(`
    SELECT
      ing.nome AS nome_ingrediente,
      SUM(ri.qtd_ingrediente * orp.multiplicador) AS total_qtd
    FROM
      tb_order_recipe AS orp
    JOIN tb_recipe AS r ON r.id = orp.id_recipe
    JOIN tb_recipe_ingredient AS ri ON ri.id_recipe = r.id
    JOIN tb_ingredient AS ing ON ing.id = ri.id_ingredient
    WHERE
      orp.id_order = ?
    GROUP BY
      ing.nome
    ORDER BY
      ing.nome;
  `, [idPedido]);

  return rows;
}

export {
  criarTabelas,
  popularBanco,
  gerarListaDeCompras
};
