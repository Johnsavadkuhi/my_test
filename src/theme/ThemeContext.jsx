
import { createContext, useContext, useReducer } from "react";

export const ThemeContext = createContext();

const initialState = { theme: "light", fontSize: 16 }

function reducer(state, action) {

    switch (action.type) {
        case "TOGGLE_THEME":
            return { ...state, theme: state.theme === "light" ? "dark" : "light" }
        case "INCREASE_FONT":
            return { ...state, fontSize: state.fontSize + 2 }
        case "DECREASE_FONT":
            return { ...state, fontSize: Math.max(10, state.fontSize - 2) }
        default:
            return state;

    }
}

function ThemeProvider({ children }) {
 
    const [state , dispatch ] = useReducer(reducer , initialState)

    const value = {state , dispatch } 
    return (
        <ThemeContext value={value}>
            {children}
        </ThemeContext>
    )


}


export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error("useTheme must be inside ThemeProvider ");
    return context;

}

export default ThemeProvider 