import styled from "@emotion/styled";
import { Button } from "@mui/material";

export const GeneralButton = styled(Button)(
    ({ theme, bts }: any) => `
    border-radius: 20px;
    width: 100%;
    font-weight: 400;
    font-size: 18px;
    line-height: 27px;
    height: 50px;
    margin-bottom: 20px;
    color: ${bts === "link" ? theme.colors.accent : theme.colors.white};
    border-color:${bts === "link" ? theme.colors.accent : theme.colors.accent};
    background-color: ${bts === "link" ? theme.colors.white : theme.colors.accent};
     :hover {
        background-color: ${bts === "link" ? theme.colors.hoverWhite : theme.colors.hoverAccent};
    }
`
);
