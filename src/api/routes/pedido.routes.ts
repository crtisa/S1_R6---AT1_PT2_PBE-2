import Router from 'express';
import { pedidoController } from '../controllers/pedido.controller';
const pedidoRoutes = Router();

pedidoRoutes.post('/', pedidoController.criar);
pedidoRoutes.get('/', pedidoController.listar);
pedidoRoutes.put('/remocao', pedidoController.atualizarRemItem);
pedidoRoutes.put('/adicao', pedidoController.atualizarAddItem);
pedidoRoutes.put('/status', pedidoController.atualizarStatus)
pedidoRoutes.delete('/:id', pedidoController.excluir);

export default pedidoRoutes;