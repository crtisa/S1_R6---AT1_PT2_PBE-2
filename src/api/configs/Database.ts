import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Verificação das variáveis de ambiente
if (
    !process.env.DB_HOST ||
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_DATABASE
) {
    console.error("Variáveis de ambiente encontradas:", {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_DATABASE
    });

    throw new Error(
        "Faltando variáveis críticas no arquivo .env para o banco de dados."
    );
}

class Database {
    private static instance: Database | null = null;
    private pool!: mysql.Pool;

    private constructor() {
        // Singleton
    }

    private createPool() {
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                port: Number(process.env.DB_PORT) || 3306,
                waitForConnections: true,
                connectionLimit: 50,
                queueLimit: 0,
                timezone: 'Z'
            });

            console.log("✅ Pool de conexão MySQL criado com sucesso.");
        } catch (error) {
            console.error("❌ Erro ao criar o pool de conexão:", error);
            throw error;
        }
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
            Database.instance.createPool();
        }
        return Database.instance;
    }

    public getPool(): mysql.Pool {
        return this.pool;
    }
}

// Função para criar o banco e as tabelas automaticamente
export async function initializeDatabase(): Promise<void> {
    console.log("Inicializando o banco de dados e tabelas...");

    try {
        const tempConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT) || 3306,
            ssl: {
                rejectUnauthorized: false
            }
        });

        const dbName = process.env.DB_DATABASE || 'S1_R6_AT1';

        // Cria o banco se não existir
        await tempConnection.query(
            `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`
        );

        // Seleciona o banco
        await tempConnection.query(`USE \`${dbName}\`;`);

        // Tabela categorias
        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS categorias (
                idCategoria INT PRIMARY KEY AUTO_INCREMENT,
                NomeCategoria VARCHAR(30) NOT NULL,
                DescricaoCategoria VARCHAR(300),
                DataCad DATETIME,
                DataMod DATETIME

            );
        `);

        

        // Tabela produtos
        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS produtos (
                idProduto INT PRIMARY KEY AUTO_INCREMENT,
                FK_IdCategoria INT,
                nomeProduto VARCHAR(30) NOT NULL,
                DescricaoProduto VARCHAR(30),
                PrecoProduto DECIMAL(10
                ,2) NOT NULL,
                QuantidadeEstoque INT,
                VinculoImagem VARCHAR(255),
                DataCad DATETIME,
                DataMod DATETIME
                CONSTRAINT fk_produto_categoria
                    FOREIGN KEY (FK_IdCategoria)
                    REFERENCES categorias(idCategoria)
                    ON DELETE SET NULL
                    ON UPDATE CASCADE
            );
        `);
        // Tabela pedidos
        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS itens_pedidos (
                idPedido INT PRIMARY KEY AUTO_INCREMENT,
                FK_IdPedido INT,
                FK_IdProduto INT,
                Quantidade INT,
                valor DECIMAL(10,2),
                DataCad DATETIME,
                DataMod DATETIME,
                CONSTRAINT fk_pedido_id_pedido
                    FOREIGN KEY (FK_IdPedido)
                    REFERENCES pedidos(IdPedido)
                    ON DELETE SET NULL
                    ON UPDATE CASCADE,
                CONSTRAINT fk_pedido_produtos
                    FOREIGN KEY (FK_IdProduto)
                    REFERENCES pedidos(idProduto)
                    ON DELETE SET NULL
                    ON UPDATE CASCADE
            );
        `);

         // Tabela pedidos
        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS pedidos (
                IdPedido INT PRIMARY KEY AUTO_INCREMENT,
                StatusPedido VARCHAR(30) NOT NULL,
                ValorTotal DECIMAL(12,2) NOT NULL,
                DataCad DATETIME,
                DataMod DATETIME
            );
        `);


        await tempConnection.end();

        console.log(
            "✅ Banco de dados e tabelas verificados/criados com sucesso."
        );
    } catch (error) {
        console.error("❌ Erro ao criar o banco ou as tabelas:", error);
        throw error;
    }
}

// Exporta o pool pronto para uso
export const connection = Database.getInstance().getPool();