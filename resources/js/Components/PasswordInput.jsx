import { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

export default function PasswordInput({ 
    value,
    onChange,
    label = "Contraseña",
    showToggle = true,
    error = null,
    className = "",
    ...props 
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={className}>
            <InputLabel htmlFor="password" value={label} />

            <TextInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                className="mt-1 block w-full"
                {...props}
            />

            <InputError message={error} className="mt-2" />

            {showToggle && (
                <label className="mt-2 flex items-center">
                    <Checkbox
                        name="showPassword"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                    />
                    <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                        Mostrar contraseña
                    </span>
                </label>
            )}
        </div>
    );
}