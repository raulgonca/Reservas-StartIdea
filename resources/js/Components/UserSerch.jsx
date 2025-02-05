import React, { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function UserSearch({ users, value, onChange, error }) {
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');

    useEffect(() => {
        if (value && value.length > 0) {
            // Filtrar usuarios según el input y mostrar los 5 primeros
            const filtered = users
                .filter(user => user.name.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 5);
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    }, [value, users]);

    const handleSelectUser = (user) => {
        setSelectedUser(user.name);
        onChange(user.id);
    };

    return (
        <div className="mb-4">
            <InputLabel htmlFor="user_id" value="Buscar usuario" />
            <TextInput
                type="text"
                name="user_id"
                value={selectedUser || value}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:ring-indigo-500"
                autoComplete="off"
                isFocused={true}
                onChange={(e) => {
                    setSelectedUser('');
                    onChange(e.target.value);
                }}
            />
            {filteredUsers.length > 0 && (
                <ul className="bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto rounded-md shadow-lg dark:bg-gray-900 dark:border-gray-700">
                    {filteredUsers.map(user => (
                        <li
                            key={user.id}
                            className="p-2 cursor-pointer rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:ring-indigo-500 hover:bg-gray-100 focus:bg-indigo-100 focus:text-indigo-900 dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:focus:text-white"
                            onClick={() => handleSelectUser(user)}
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