import React, { useState, useEffect } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";

SyntaxHighlighter.registerLanguage("javascript", javascript);
import styles from "./ShogiKifViewer.module.css";

interface ShogiKifViewerProps {
    src: string;
    onChange: (content: string) => void;
}

export const ShogiKifViewer: React.FC<ShogiKifViewerProps> = ({ src, onChange }) => {
    const [fileContent, setFileContent] = useState("");

    useEffect(() => {
        if (src) {
            const fileExtension = src.split(".").pop()?.toLowerCase();
            if (fileExtension === "kif") {
                fetch(src)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            if (typeof reader.result === "string") {
                                setFileContent(reader.result);
                                onChange(reader.result);
                            }
                        };
                        reader.readAsText(blob, "Shift_JIS");
                    });
            }
        }
    }, [src, onChange]);

    // Render the file content or other components here
    return (
        <div>
            <SyntaxHighlighter language="javascript" wrapLongLines className={styles.tCodeBlock} style={a11yLight}>
                {fileContent}
            </SyntaxHighlighter>
        </div>
    );
};
