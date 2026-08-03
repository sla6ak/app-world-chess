// WS повідомлення лише для ігрового процесу (ходи, нічия, здача, завершення гри)

export const reqWsGameMove = (idWs: string, position: string[], move: boolean) => {
    const req = { idWs, event: "gameMove", position, move };
    return req;
};

export const reqWsGameOver = (idWs: string, result: string, ratingChange: number) => {
    const req = { idWs, event: "gameOver", result, ratingChange };
    return req;
};

export const reqWsResignGame = (idWs: string, gameId: string, userId: string) => {
    const req = { idWs, event: "resign_game", gameId, userId };
    return req;
};

export const reqWsOfferDraw = (idWs: string, gameId: string, userId: string) => {
    const req = { idWs, event: "offer_draw", gameId, userId };
    return req;
};

export default { reqWsGameMove, reqWsGameOver, reqWsResignGame, reqWsOfferDraw };
