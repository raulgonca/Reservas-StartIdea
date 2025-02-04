import React, { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function UserSearch({ users, value, onChange, error }) {
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        // Filtrar usuarios según el input y mostrar los 5 primeros
        const filtered = users
            .filter(user => user.name.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 5);
        setFilteredUsers(filtered);
    }, [value, users]);

    return (
        <div className="mb-4">
            <InputLabel htmlFor="user_id" value="Usuario" />
            <TextInput
                type="text"
                name="user_id"
                value={value}
                className="mt-1 block w-full"
                autoComplete="off"
                isFocused={true}
                onChange={(e) => onChange(e.target.value)}
            />
            {filteredUsers.length > 0 && (
                <ul className="bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto">
                    {filteredUsers.map(user => (
                        <li
                            key={user.id}
                            className="p-2 cursor-pointer hover:bg-gray-200"
                            onClick={() => onChange(user.id)}
                        >
                            {user.name}
                        </li>
                    ))}
                </ul>
            )}
            <InputError message={error} className="mt-2" />
        </div>
    );
}