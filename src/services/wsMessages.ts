// WS повідомлення лише для ігрового процесу (ходи, завершення гри)

export const reqWsGameMove = (idWs: string, position: string[], move: boolean) => {
    const req = { idWs, event: "gameMove", position, move };
    return req;
};

export const reqWsGameOver = (idWs: string, result: string, ratingChange: number) => {
    const req = { idWs, event: "gameOver", result, ratingChange };
    return req;
};

export default { reqWsGameMove, reqWsGameOver };
