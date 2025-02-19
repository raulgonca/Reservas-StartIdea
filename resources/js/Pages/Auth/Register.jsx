import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    validateName,
    validateEmail,
    validatePassword,
    validatePhone,
    validateDni,
} from '../../../Helpers/validation';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        dni: '',
    });

    const [clientErrors, setClientErrors] = useState({});

    const handleBlur = (field, value) => {
        let error = '';
        switch (field) {
            case 'name':
                error = validateName(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value, data.password_confirmation);
                break;
            case 'phone':
                error = validatePhone(value);
                break;
            case 'dni':
                error = validateDni(value);
                break;
            default:
                break;
        }
        setClientErrors({ ...clientErrors, [field]: error });
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Formulario de Registro" />
            

            <form onSubmit={submit} noValidate>
                <div>
                    <InputLabel htmlFor="name" value="Nombre" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        onBlur={(e) => handleBlur('name', e.target.value)}
                        required
                    />

                    <InputError message={clientErrors.name || errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        onBlur={(e) => handleBlur('email', e.target.value)}
                        required
                    />

                    <InputError message={clientErrors.email || errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="phone" value="Teléfono" />

                    <TextInput
                        id="phone"
                        type="text"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('phone', e.target.value)}
                        onBlur={(e) => handleBlur('phone', e.target.value)}
                        required
                    />

                    <InputError message={clientErrors.phone || errors.phone} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="dni" value="DNI" />

                    <TextInput
                        id="dni"
                        type="text"
                        name="dni"
                        value={data.dni}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('dni', e.target.value)}
                        onBlur={(e) => handleBlur('dni', e.target.value)}
                        required
                    />

                    <InputError message={clientErrors.dni || errors.dni} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        onBlur={(e) => handleBlur('password', e.target.value)}
                        required
                    />

                    <InputError message={clientErrors.password || errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar Contraseña"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        onBlur={(e) => handleBlur('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError
                        message={clientErrors.password_confirmation || errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                    >
                        ¿Ya estás registrado?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Registrarme
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
