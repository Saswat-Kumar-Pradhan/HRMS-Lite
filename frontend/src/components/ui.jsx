export function LoadingSpinner({ message = "Loading..." }) {
    return (
        <div className="state-container">
            <div className="spinner" />
            <p className="state-desc">{message}</p>
        </div>
    );
}

export function EmptyState({ icon = "📭", title, description, action }) {
    return (
        <div className="state-container">
            <div className="state-icon">{icon}</div>
            <p className="state-title">{title}</p>
            {description && <p className="state-desc">{description}</p>}
            {action && <div style={{ marginTop: 8 }}>{action}</div>}
        </div>
    );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
    return (
        <div className="state-container">
            <div className="state-icon">⚠️</div>
            <p className="state-title">Failed to load</p>
            <p className="state-desc">{message}</p>
            {onRetry && (
                <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={onRetry}>
                    Try again
                </button>
            )}
        </div>
    );
}

export function Button({ children, variant = "primary", size, disabled, onClick, type = "button", ...props }) {
    const cls = `btn btn-${variant}${size ? ` btn-${size}` : ""}`;
    return (
        <button className={cls} disabled={disabled} onClick={onClick} type={type} {...props}>
            {children}
        </button>
    );
}

export function Badge({ status }) {
    const cls = status === "Present" ? "badge badge-present" : "badge badge-absent";
    return <span className={cls}>{status}</span>;
}

export function Modal({ title, onClose, children }) {
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}
