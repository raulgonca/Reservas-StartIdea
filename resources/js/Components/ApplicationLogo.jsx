export default function ApplicationLogo(props) {
    return (
        <div {...props} className="flex items-center justify-center my-4">
            <img
                src="/images/HUB-Blanco.png"
                alt="Logo startidea"
                className="h-14 w-18"
            />
            <img
                src="/images/Agencia.png"
                alt="Logo startidea"
                className="h-20 w-20"
            />
            
        </div>
    );
}