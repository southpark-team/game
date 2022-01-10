import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";

import { World } from "@/game/world/world";
import { routes } from "@/config/routes/routes";

export const useGame = () => {
    const [isActive, setActive] = useState(true);
    const [isGameOver, setGameOver] = useState(false);
    const [isPaused, setPause] = useState(false);
    const [world] = useState(new World());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const history = useHistory();

    const callMenu = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setActive(true);
            setPause(true);
            world.stopAnimation();
        }
    }, []);

    const callGameOver = useCallback(() => {
        setActive(true);
        setGameOver(true);
        world.destroy();
    }, []);

    const setUpPauseButton = useCallback(() => {
        document.addEventListener("keydown", callMenu);
    }, []);

    const onClose = useCallback(() => {
        setActive(false);
        history.push(routes.main.path);
    }, []);

    const onStart = useCallback(() => {
        world.init({
            canvas: canvasRef.current,
            gameOverCallback: callGameOver,
        });
        setGameOver(false);
        setPause(false);
        setActive(false);
    }, []);

    const onResume = useCallback(() => {
        world.startAnimataion();
        setPause(false);
        setActive(false);
    }, []);

    const onUnmount = useCallback(() => {
        world.destroy();
        document.removeEventListener("keydown", callMenu);
    }, []);

    return {
        isActive,
        isPaused,
        canvasRef,
        onStart,
        onResume,
        onClose,
        onUnmount,
        setUpPauseButton,
        isGameOver,
    };
};