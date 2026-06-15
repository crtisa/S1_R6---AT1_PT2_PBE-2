import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../configs/Database';
import { Pedidos } from '../models/Pedidos';
import { ItensPedido } from '../models/Itens_Pedido';
import { enumStatusPedido } from '../enum/statusPedido';

const pedidoRepository = {
    create: async (pedido: Pedidos, itens_Pedido: ItensPedido[]): Promise<any> => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            const sqlPed = 'INSERT INTO pedidos ( SubTotal, Status) VALUES (?,?,?)';
            const valuesPed = [pedido.subTotal, pedido.status];
            const [rowsPed] = await conn.execute<ResultSetHeader>(sqlPed, valuesPed);

            const novoIdPedido = rowsPed.insertId;


            for (const item of itens_Pedido) {
                const sqlItm = 'INSERT INTO itens_pedido (fk_IdPedido, fk_IdProduto, Quantidade, Valor) VALUES (?,?,?,?)';
                const valuesItm = [novoIdPedido, item.produtoId, item.quantidade, item.valor];
                await conn.execute(sqlItm, valuesItm);
            }

            await conn.commit();
            return { pedidoId: novoIdPedido, subTotal: pedido.subTotal }; 
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // 2. LER PEDIDOS (COM JOIN)
    read: async (idPedido?: number): Promise<any[]> => {
        let sql = `
        SELECT p.*, i.IdItem_Pedido, i.FK_IdProduto, i.Quantidade, i.Valor
        FROM Pedidos p
        LEFT JOIN Itens_Pedido i ON p.IdPedido = i.FK_IdPedido`;

        const params: any[] = [];

        if (idPedido) {
            sql += ` WHERE p.IdPedido = ?`;
            params.push(idPedido);
        }

        const [rows] = await connection.execute(sql, params);

        return rows as any;
    },

    // 3. ATUALIZAR STATUS
    updateStatus: async (Status: enumStatusPedido, IdPedido: number): Promise<boolean> => {
        const sql = 'UPDATE pedidos SET Status = ? WHERE IdPedido = ?';
        const [rows] = await connection.execute<ResultSetHeader>(sql, [Status, IdPedido]);
        return rows.affectedRows > 0;
    },

    // 4. REMOVER ITEM E ATUALIZAR SUBTOTAL
    updateRemocao: async (IdItemPedido: number, pedidoAtualizado: Pedidos): Promise<boolean> => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            const sqlRemocao = 'DELETE FROM itens_pedido WHERE IdItens_Pedido = ?';
            const [resultDelete] = await conn.execute<ResultSetHeader>(sqlRemocao, [IdItemPedido]);

            const sqlUpdatePedido = 'UPDATE pedidos SET SubTotal = ? WHERE IdPedido = ?';
            await conn.execute(sqlUpdatePedido, [pedidoAtualizado.subTotal, pedidoAtualizado.id]);

            await conn.commit();
            return resultDelete.affectedRows > 0;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // 5. ADICIONAR ITEM E ATUALIZAR SUBTOTAL
    updateAdicao: async (IdPedido: number, pedidoAtualizado: Pedidos, item: ItensPedido): Promise<boolean> => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            // Insere o novo item
            const sqlItm = 'INSERT INTO itens_pedido (fk_IdPedido, fk_IdProduto, Quantidade, Valor) VALUES (?,?,?,?)';
            await conn.execute(sqlItm, [IdPedido, item.produtoId, item.quantidade, item.valor]);

            const sqlUpdatePedido = 'UPDATE pedidos SET SubTotal = ? WHERE IdPedido = ?';
            await conn.execute(sqlUpdatePedido, [pedidoAtualizado.subTotal, IdPedido]);

            await conn.commit();
            return true;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // 6. EXCLUIR PEDIDO (E SEUS ITENS)
    delete: async (IdPedido: number): Promise<boolean> => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();
            // Deleta filhos primeiro por causa da FK
            await conn.execute('DELETE FROM itens_pedido WHERE fk_IdPedido=?', [IdPedido]);
            const [rowsPed] = await conn.execute<ResultSetHeader>('DELETE FROM pedidos WHERE IdPedido=?', [IdPedido]);

            await conn.commit();
            return rowsPed.affectedRows > 0;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    findById: async (idItem: number): Promise<ItensPedido | null> => {
        const sql = 'SELECT * FROM itens_pedido WHERE IdItens_Pedido = ?';
        const [rows] = await connection.execute<RowDataPacket[]>(sql, [idItem]);

        if (rows.length === 0) return null;

        const data = rows[0];
        return new ItensPedido(
            data.IdItens_Pedido,
            data.fk_IdPedido,
            data.fk_IdProduto,
            Number(data.Valor),
            Number(data.Quantidade)
        );
    }
};

export { pedidoRepository };