import { createTheme } from "@mui/material";

const customTheme: any = {
    colors: {
        white: "#FFFFFF",
        accent: "#4A56E2",
        green: "#663517",
        purpure: "#FF6596",
        text: "#000000",
        helperText: "#BDBDBD",
        iconColor: "#E0E0E0",
        fone: "#E5E5E5",
        error: "#97000099",
        hoverGreen: "#3a1401",
        hoverWhite: "#eef",
        category: {
            car: "#FD9498",
            food: "#FFD8D0",
            education: "#81E1FF",
            selfCare: "#C5BAFF",
            children: "#6E78E8",
            house: "#4A56E2",
            basicExp: "#FED057",
            leisure: "#24CCA7",
            other: "#00AD84",
        },
    },
};

export const materialTheme: any = createTheme(customTheme);
