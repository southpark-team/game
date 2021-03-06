import { notification } from "antd";

import APIService from "@/services/API";
import { Method } from "@/services/API/API.service";
import { apiRoutes } from "@/config/apiRoutes";

const { serviceId, signIn, redirectURI } = apiRoutes.oauth;

class OAuthApi {
    isSuccessfulRequest(response: Response, isSignIn?: boolean) {
        const errorMessage = "Отправленные данные не корректны";
        switch (response.status) {
            case 200:
                if (isSignIn) {
                    notification.success({ message: "Вход выполнен успешно" });
                }
                return true;
            case 400:
                notification.error({ message: errorMessage });
                return false;
            case 401:
                notification.error({ message: "Ошибка доступа" });
                return false;
            case 500:
                notification.error({ message: "Произошла неизвестная ошибка" });
                return false;
            default:
                return false;
        }
    }

    public async getServiceId(redirectURI: string): Promise<string | null> {
        const response = await APIService.request(Method.GET, serviceId, redirectURI);
        if (response) {
            const success = this.isSuccessfulRequest(response);
            if (success) {
                const result = await response.json();
                return result.service_id ?? null;
            }
        }
        return null;
    }

    public async signUpWithYandex(code: string): Promise<boolean> {
        const response = await APIService.request(Method.POST, signIn, {
            code,
            redirect_uri: redirectURI,
        });
        if (response) {
            return this.isSuccessfulRequest(response, true);
        }
        return false;
    }
}

export default new OAuthApi();
