import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Pause28Filled, Play28Filled } from "@fluentui/react-icons";

import styles from "./Example.module.css";

interface Props {
    onExampleClicked: (value: string) => void;
    useGPT4V?: boolean;
    promptTemplateKey?: string;
}

// Lazy load the Example component
const Example = lazy(() => import("./Example").then(module => ({ default: module.Example })));

const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const generateExamplesArray = (type: string, t: (key: string) => string): string[] => {
    let examples: string[] = [];
    let i = 1;
    let example = t(`${type}.${i}`);
    while (example !== `${type}.${i}`) {
        examples.push(example);
        i++;
        example = t(`${type}.${i}`);
    }
    return examples;
};

export const ExampleList = ({ onExampleClicked, useGPT4V, promptTemplateKey }: Props) => {
    const { t } = useTranslation();

    const DEFAULT_EXAMPLES = useMemo(() => {
        switch (promptTemplateKey) {
            case "1":
                return generateExamplesArray("defaultExamples.1", t);
            case "2":
                return generateExamplesArray("defaultExamples.2", t);
            case "3":
                return generateExamplesArray("defaultExamples.3", t);
            default:
                return generateExamplesArray("defaultExamples", t);
        }
    }, [promptTemplateKey, t]);

    const GPT4V_EXAMPLES = useMemo(() => generateExamplesArray("gpt4vExamples", t), [t]);

    const [currentExamples, setCurrentExamples] = useState<string[]>([]);
    const [isShuffling, setIsShuffling] = useState<boolean>(true);
    const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

    useEffect(() => {
        const loadExamples = () => {
            const examples = useGPT4V ? GPT4V_EXAMPLES : DEFAULT_EXAMPLES;
            setCurrentExamples(shuffleArray(examples).slice(0, 3));
        };

        if (isShuffling) {
            loadExamples();
            const secondsIntervalId = setInterval(() => setSecondsElapsed(prev => prev + 1), 1000);
            const intervalId = setInterval(loadExamples, 7000);
            return () => {
                clearInterval(intervalId);
                clearInterval(secondsIntervalId);
            };
        }
    }, [isShuffling, useGPT4V, DEFAULT_EXAMPLES, GPT4V_EXAMPLES]);

    const handleStart = () => setIsShuffling(true);
    const handleStop = () => setIsShuffling(false);

    return (
        <div className={styles.container}>
            <div className={styles.buttonContainer}>
                {isShuffling ? (
                    <>
                        <Pause28Filled
                            onClick={() => {
                                handleStop();
                                setSecondsElapsed(0); // Reset countdown
                            }}
                            className={styles.iconButton}
                            primaryFill="rgba(115, 118, 225, 1)"
                        />
                        <span className={styles.counter}>{7 - (secondsElapsed % 7)}s.</span>
                    </>
                ) : (
                    <Play28Filled onClick={handleStart} className={styles.iconButton} primaryFill="rgba(115, 118, 225, 1)" />
                )}
            </div>
            <ul className={styles.examplesNavList}>
                {currentExamples.map((question, i: number) => (
                    <li key={i}>
                        <Suspense fallback={<div>Loading...</div>}>
                            <Example text={question} value={question} onClick={onExampleClicked} />
                        </Suspense>
                    </li>
                ))}
            </ul>
        </div>
    );
};
