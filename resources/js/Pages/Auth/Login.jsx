// Importación de componentes necesarios
import { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Componente Login - Maneja el formulario de inicio de sesión
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Mensaje de estado actual
 * @param {boolean} props.canResetPassword - Indica si se permite restablecer la contraseña
 */
export default function Login({ status, canResetPassword }) {
    // Estado para mostrar/ocultar contraseña
    const [showPassword, setShowPassword] = useState(false);

    // Inicialización del formulario con useForm
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    /**
     * Maneja el envío del formulario
     * @param {Event} e - Evento del formulario
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            {/* Título de la página */}
            <Head title="Iniciar sesión" />

            {/* Muestra mensaje de estado si existe */}
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {/* Formulario de inicio de sesión */}
            <form onSubmit={submit}>
                {/* Campo de correo electrónico */}
                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Campo de contraseña */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />
                    <TextInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Opciones de usuario */}
                <div className="mt-4 space-y-2">
                    {/* Checkbox para mostrar/ocultar contraseña */}
                    <label className="flex items-center">
                        <Checkbox
                            name="showPassword"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            Mostrar contraseña
                        </span>
                    </label>

                    {/* Checkbox para recordar usuario
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            Recuérdame
                        </span>
                    </label> */}
                </div>

                {/* Pie del formulario */}
                <div className="mt-4 flex items-center justify-end">
                    {/* Link para restablecer contraseña - Comentado por ahora */}
                    {/* {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )} */}

                    {/* Botón de envío */}
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Iniciar sesión
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}