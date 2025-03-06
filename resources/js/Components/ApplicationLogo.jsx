export default function ApplicationLogo(props) {
    const handleClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div {...props} className="flex items-center justify-center space-x-4">
            <div 
                onClick={() => handleClick('https://hubstartidea.es/')}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                role="link"
                tabIndex={0}
            >
                <img
                    src="/images/HUB-Blanco.png"
                    alt="Logo Hub Start Idea"
                    className="h-14 w-18"
                />
            </div>
            
        </div>
    );
}