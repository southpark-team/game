import React, {FC} from "react";
import {SignInFieldNames, SignInValues, useSignInForm} from './SignIn.helpers';
import { UserOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import styles from './SignIn.module.scss';
import Container from "../../components/Container";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Password from "../../components/Password";
import Nav from "../../components/InnerNavBar";
import Header from "../../components/Header";
import {routes} from "../../config/routes/routes";

const SignIn:FC = () => {
    const { onSubmit } = useSignInForm();

    const onFinish = (values: SignInValues) => {
        onSubmit(values);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Container>
            <Header/>
            <div className={styles.formContainer}>
                <Nav currentRoute={`/#${routes.signIn.path}`}/>
                <Form
                    name='signIn'
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    layout='vertical'>
                    <Form.Item
                        name={SignInFieldNames.login}
                        rules={[{ required: true, message: 'Введите логин' }]}>
                        <Input placeholder='логин' prefix={<UserOutlined />}/>
                    </Form.Item>
                    <Form.Item
                        name={SignInFieldNames.password}
                        rules={[{ required: true, message: 'Введите пароль' }]}>
                        <Password placeholder='пароль' />
                    </Form.Item>
                    <Form.Item>
                        <Button block type="primary" htmlType="submit">Войти</Button>
                    </Form.Item>
                </Form>
            </div>
        </Container>
    );
};

export default SignIn;