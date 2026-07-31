export const reqWsStartApp = (idWs: string, token: string, color: string) => {
    const req = { idWs, token, event: "startApp", color };
    return req;
};
export const reqWsGame = (data: any) => {
    const req = { idWs: data.idWs, event: "game" };
    return req;
};
export const reqWsStartGame = (
    timeControl: number,
    timePluse: number,
    typeGame: string,
    token: string,
    idWs: string,
    color: string
) => {
    const req = { idWs, typeGame, token, color, timeControl, timePluse, event: "startGame" };
    return req;
};

export default { reqWsStartApp, reqWsGame, reqWsStartGame };

