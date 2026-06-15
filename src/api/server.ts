import express from 'express';
import router from './routes/routes';
import { initializeDatabase } from './configs/Database';
import 'dotenv/config';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT;

app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(cors());
app.use('/', router);




initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`)
    });
}).catch(err => {
    console.error("Erro ao inicializar o banco de dados:", err);
});