import React, { FC } from "react";

import { routes as appRoutes } from "@/config/routes/routes";
import { useSelector } from "@/hooks/useSelector";

import styles from "./Header.module.scss";
import NavBar from "../NavBar";
import { useHeader } from "./Header.helpers";
import { Link } from "react-router-dom";

interface Props {
    currentPath?: string;
}

const Header: FC<Props> = ({ currentPath }) => {
    const { routes, renderSignOutButton } = useHeader();

    const isSignedIn = useSelector((state) => state.auth.isSignedIn);

    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <Link to={appRoutes.main.path}>Logo</Link>
            </div>
            <div className={styles.routesContainer}>
                <NavBar currentPath={currentPath} routes={routes} />
                <div className={styles.buttonContainer}>
                    {isSignedIn && renderSignOutButton()}
                </div>
            </div>
        </div>
    );
};

export default Header;
