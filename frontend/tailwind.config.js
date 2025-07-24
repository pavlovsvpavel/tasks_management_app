/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                "ubuntu-normal": ['ubuntu-normal'],
                "ubuntu-bold": ['ubuntu-bold'],
                "ubuntu-semibold": ['ubuntu-semibold'],
                "ubuntu-light": ['ubuntu-light'],
            },
            colors: {
                site_bg: "#cccccc",
                primary: "#030014",
                secondary: "#151312",
                light: {
                    100: "#D6C7FF",
                    200: "#A8B5DB",
                    300: "#9CA4AB",
                },
                dark: {
                    100: "#676767",
                    200: "#030014",
                },
                accent: "#AB8BFF",
                btn_color: "#3B82F6",
                text_color: "#ffffff"
            },
        },
    },
    plugins: [],
};

