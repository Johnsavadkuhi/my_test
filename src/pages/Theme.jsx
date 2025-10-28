import { useTheme } from "../theme/ThemeContext";
import Counter from "./Counter";

export default function Theme() {

    const { state, dispatch } = useTheme()

    console.log("state : ", state)

    return (
        <div
          style={{
            background: state.theme === "light" ? "#fff" : "#222",
            color: state.theme === "light" ? "#000" : "#fff",
            fontSize: state.fontSize,
            padding: "1rem",
          }}
        >
            <button onClick={() => dispatch({ type: "TOGGLE_THEME" })}>
                Toggle Theme
            </button>
            <Counter theme={state.theme}/>
        </div>
    );
}