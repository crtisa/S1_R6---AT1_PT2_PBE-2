import {Router} from 'express';
const routes = Router();
import categoriaRoutes from './categoria.routes';
import produtoRoutes from './produto.routes';
import pedidoRoutes from './pedido.routes';
import imagemRoutes from './imagemProduto.routes';

routes.use('/categorias', categoriaRoutes);
routes.use('/produtos', produtoRoutes);
routes.use('/pedidos', pedidoRoutes);
routes.use('/imagens', imagemRoutes)

export default routes;