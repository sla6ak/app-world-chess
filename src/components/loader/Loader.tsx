import { SpinnerDotted } from "spinners-react";

function Loader() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen bg-theme-primary gap-4">
            <SpinnerDotted size={48} thickness={100} speed={100} color="var(--color-accent)" />
            <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Loading...
            </span>
        </div>
    );
}

export default Loader;
