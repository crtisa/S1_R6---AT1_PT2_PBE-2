export class ItensPedido {
    private _id: number | null;
    private _pedidoId: number;
    private _produtoId: number;
    private _quantidade: number;
    private _valor: number;
    private _dataCad: string;
    private _dataMod: string;

    constructor(
        id: number | null = null,
        pedidoId: number = 0,
        produtoId: number = 0,
        valor: number = 0,
        quantidade: number = 0
    ) {
        // Validações disparadas na construção do objeto
        if (id !== null) this.validarId(id);
        if (pedidoId > 0) this.validarIdAuxiliar(pedidoId);
        if (produtoId > 0) this.validarIdAuxiliar(produtoId);
        this.validarValor(valor);
        this.validarQuantidade(quantidade);

        this._id = id;
        this._pedidoId = pedidoId;
        this._produtoId = produtoId;
        this._valor = valor;
        this._quantidade = quantidade;
        this._dataCad = new Date().toISOString();
        this._dataMod = new Date().toISOString();
    }

    // --- Getters ---
    get id(): number | null { return this._id; }
    get pedidoId(): number { return this._pedidoId; }
    get produtoId(): number { return this._produtoId; }
    get valor(): number { return this._valor; }
    get quantidade(): number { return this._quantidade; }
    get dataCad(): string { return this._dataCad; }
    get dataMod(): string { return this._dataMod; }

    // --- Setters com Validações Corrigidas ---
    set id(value: number | null) {
        if (value !== null) this.validarId(value);
        this._id = value;
    }

    set pedidoId(value: number) {
        this.validarIdAuxiliar(value);
        this._pedidoId = value; 
        console.log("TESTE");
    }

    set produtoId(value: number) {
        this.validarIdAuxiliar(value);
        this._produtoId = value;
    }

    set valor(value: number) {
        this.validarValor(value);
        this._valor = value;
    }

    set quantidade(value: number) {
        this.validarQuantidade(value);
        this._quantidade = value;
    }

    // --- VALIDATIONS METHODS ---
    private validarId(value: number) {
        if (isNaN(value) || value <= 0) {
            throw new Error('O ID deve ser um número válido e maior que zero.');
        }
    }

    private validarIdAuxiliar(value: number) {
        if (!value || isNaN(value) || value <= 0) {
            throw new Error('O ID auxiliar (Pedido/Produto) deve ser um número válido.');
        }
    }

    private validarValor(value: number) {
        if (value === undefined || isNaN(value) || value < 0) {
            throw new Error('O valor deve ser um número racional maior ou igual a 0.');
        }
    }

    private validarQuantidade(value: number) {
        if (!value || isNaN(value) || value <= 0) {
            throw new Error('A quantidade deve ser um número maior que zero.');
        }
    }

    // --- STATIC METHODS ---
    static calcularSubTotal(itens: ItensPedido[]): number {
        return itens.reduce((total, item) => total + (item.valor * item.quantidade), 0);
    }

    // --- FACTORY METHODS ---
    static criar(dados: any): ItensPedido {
        return new ItensPedido(
            null, 
            dados.pedidoId || 0, 
            dados.produtoId, 
            dados.valor, 
            dados.quantidade
        );
    }

    static editar(dados: any, id: number): ItensPedido {
        return new ItensPedido(
            id, 
            dados.pedidoId, 
            dados.produtoId, 
            dados.valor, 
            dados.quantidade
        );
    }
}