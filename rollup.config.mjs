import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
// import dts from "rollup-plugin-dts";

import packageJson from "./package.json" assert { type: "json" }

export default [
    {
        input: "src/index.ts",
        output: [
            // {
            //     file: packageJson.main,
            //     format: "cjs",
            //     sourcemap: true,
            //     globals: {
            //         react: "React",
            //         "react-dom": "ReactDom"
            //     }
            // },
            {
                file: packageJson.module,
                format: "esm",
                // sourcemap: true,
                // globals: {
                //     react: "React",
                //     "react-dom": "ReactDom"
                // },
            },
        ],
        external: ['react', 'react-router'],
        plugins: [
            resolve(),
            commonjs(),
            typescript({ tsconfig: "./tsconfig.json" }),
        ],
    },
    //   {
    //     input: "dist/esm/types/index.d.ts",
    //     output: [{ file: "dist/index.d.ts", format: "esm" }],
    //     plugins: [dts()],
    //   },
]
