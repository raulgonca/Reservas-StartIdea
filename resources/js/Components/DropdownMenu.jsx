import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

function DropdownMenu({ title, links }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-70 bg-white border-none  hover: focus:outline-none  dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                    {title}
                    <svg className="w-5 h-5 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content>
                {links.map((link) => (
                    <ResponsiveNavLink key={link.href} href={link.href} active={link.active}>
                        {link.label}
                    </ResponsiveNavLink>
                ))}
            </Dropdown.Content>
        </Dropdown>
    );
}

export default DropdownMenu;