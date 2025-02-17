export default function ApplicationLogo(props) {
    return (
        <div {...props} className="flex items-center justify-center space-x-4">
            <a 
                href="https://hubstartidea.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
            >
                <img
                    src="/images/HUB-Blanco.png"
                    alt="Logo Hub Start Idea"
                    className="h-14 w-18"
                />
            </a>
            <a 
                href="https://startidea.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
            >
                <img
                    src="/images/Agencia.png"
                    alt="Logo Start Idea"
                    className="h-20 w-20"
                />
            </a>
        </div>
    );
}