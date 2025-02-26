// Importación de hooks de React
import { useState } from "react";

// Importación de componentes personalizados
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";
import PasswordInput from "@/Components/PasswordInput";
import GuestLayout from "@/Layouts/GuestLayout";

// Importación de componentes de Inertia
import { Head, Link, useForm } from "@inertiajs/react";

// Importación de funciones de validación
import {
    validateName,
    validateEmail,
    validatePassword,
    validatePhone,
    validateDni,
} from "../../../Helpers/validation";

/**
 * Componente Register - Maneja el formulario de registro de usuarios
 * @returns {JSX.Element} Componente de registro
 */
export default function Register() {
    // Inicialización del formulario con useForm de Inertia
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        dni: "",
    });

    // Estados locales para manejar la lógica del formulario
    const [clientErrors, setClientErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState(false);
    const [touchedFields, setTouchedFields] = useState({
        password: false,
        password_confirmation: false,
    });

    /**
     * Maneja el cambio de estado del checkbox de mostrar contraseñas
     * @param {Event} e - Evento del checkbox
     */
    const handleShowPasswords = (e) => {
        const isChecked = e.target.checked;
        setShowPasswords(isChecked);

        // Si estamos mostrando las contraseñas, limpiamos los errores
        if (isChecked) {
            setClientErrors(prev => ({
                ...prev,
                password: "",
                password_confirmation: "",
            }));
            // Reseteamos también el estado de campos tocados
            setTouchedFields(prev => ({
                ...prev,
                password: false,
                password_confirmation: false,
            }));
        }
    };

    /**
     * Valida los campos de contraseña
     * @param {string} password - Contraseña a validar
     * @param {string} confirmation - Confirmación de contraseña
     * @returns {Object} Objeto con errores de validación
     */
    const validatePasswordFields = (password, confirmation) => {
        let errors = {};

        if (password && confirmation) {
            const passwordError = validatePassword(password);
            if (passwordError) {
                errors.password = passwordError;
            } else if (password !== confirmation) {
                errors.password = "Las contraseñas no coinciden";
                errors.password_confirmation = "Las contraseñas no coinciden";
            }
        }

        return errors;
    };

    /**
     * Maneja la validación en tiempo real cuando el campo pierde el foco
     * @param {string} field - Nombre del campo a validar
     * @param {string} value - Valor del campo
     */
    const handleBlur = (field, value) => {
        // No validar contraseñas si están visibles
        if (showPasswords && (field === "password" || field === "password_confirmation")) {
            return;
        }

        // Marcar el campo como tocado
        setTouchedFields(prev => ({
            ...prev,
            [field]: true
        }));

        let error = "";
        switch (field) {
            case "name":
                error = validateName(value);
                break;
            case "email":
                error = validateEmail(value);
                break;
            case "password":
                if (touchedFields.password_confirmation || data.password_confirmation) {
                    const errors = validatePasswordFields(value, data.password_confirmation);
                    error = errors.password || "";
                }
                break;
            case "password_confirmation":
                if (data.password) {
                    const errors = validatePasswordFields(data.password, value);
                    error = errors.password_confirmation || "";
                }
                break;
            case "phone":
                error = validatePhone(value);
                break;
            case "dni":
                error = validateDni(value);
                break;
            default:
                break;
        }

        setClientErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    /**
     * Maneja el envío del formulario
     * @param {Event} e - Evento del formulario
     */
    const submit = (e) => {
        e.preventDefault();

        // Validar todos los campos antes de enviar
        const allErrors = {};
        Object.keys(data).forEach(field => {
            let error = "";
            switch (field) {
                case "name":
                    error = validateName(data[field]);
                    break;
                case "email":
                    error = validateEmail(data[field]);
                    break;
                case "phone":
                    error = validatePhone(data[field]);
                    break;
                case "dni":
                    error = validateDni(data[field]);
                    break;
                case "password":
                    // Validar la contraseña solo si no está visible
                    if (!showPasswords) {
                        error = validatePassword(data[field]);
                    }
                    break;
                default:
                    break;
            }
            if (error) allErrors[field] = error;
        });

        // Validar coincidencia de contraseñas solo si no están visibles
        if (!showPasswords && data.password !== data.password_confirmation) {
            allErrors.password = "Las contraseñas no coinciden";
            allErrors.password_confirmation = "Las contraseñas no coinciden";
        }

        // Si hay errores, actualizarlos y no enviar el formulario
        if (Object.keys(allErrors).length > 0) {
            setClientErrors(allErrors);
            return;
        }

        // Si no hay errores, enviar el formulario
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Formulario de Registro" />

            <form onSubmit={submit} noValidate>
                {/* Campo Nombre */}
                <div>
                    <InputLabel htmlFor="name" value="Nombre" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData("name", e.target.value)}
                        onBlur={(e) => handleBlur("name", e.target.value)}
                        required
                    />
                    <InputError message={clientErrors.name || errors.name} className="mt-2" />
                </div>

                {/* Campo Email */}
                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData("email", e.target.value)}
                        onBlur={(e) => handleBlur("email", e.target.value)}
                        required
                    />
                    <InputError message={clientErrors.email || errors.email} className="mt-2" />
                </div>

                {/* Campo Teléfono */}
                <div className="mt-4">
                    <InputLabel htmlFor="phone" value="Teléfono" />
                    <TextInput
                        id="phone"
                        type="text"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        onChange={(e) => setData("phone", e.target.value)}
                        onBlur={(e) => handleBlur("phone", e.target.value)}
                        required
                    />
                    <InputError message={clientErrors.phone || errors.phone} className="mt-2" />
                </div>

                {/* Campo DNI */}
                <div className="mt-4">
                    <InputLabel htmlFor="dni" value="DNI" />
                    <TextInput
                        id="dni"
                        type="text"
                        name="dni"
                        value={data.dni}
                        className="mt-1 block w-full"
                        onChange={(e) => setData("dni", e.target.value)}
                        onBlur={(e) => handleBlur("dni", e.target.value)}
                        required
                    />
                    <InputError message={clientErrors.dni || errors.dni} className="mt-2" />
                </div>

                {/* Campos de Contraseña */}
                <PasswordInput
                    name="password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    onBlur={(e) => handleBlur("password", e.target.value)}
                    error={showPasswords ? null : (clientErrors.password || errors.password)}
                    className="mt-4"
                    label="Contraseña"
                    required
                    autoComplete="new-password"
                    showPassword={showPasswords}
                    showToggle={false}
                />

                <PasswordInput
                    name="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) => setData("password_confirmation", e.target.value)}
                    onBlur={(e) => handleBlur("password_confirmation", e.target.value)}
                    error={showPasswords ? null : (clientErrors.password_confirmation || errors.password_confirmation)}
                    className="mt-4"
                    label="Confirmar Contraseña"
                    required
                    autoComplete="new-password"
                    showPassword={showPasswords}
                    showToggle={false}
                />

                {/* Control de visibilidad de contraseñas */}
                <div className="mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="showPasswords"
                            checked={showPasswords}
                            onChange={handleShowPasswords}
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            Mostrar contraseñas
                        </span>
                    </label>
                </div>

                {/* Pie del formulario */}
                <div className="mt-4 flex items-center justify-between">
                    <Link
                        href={route("login")}
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