function Icon({ size = 16, children }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

export const ChevronDownIcon = (props) => (
    <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>
);

export const PencilIcon = (props) => (
    <Icon {...props}>
        <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </Icon>
);

export const ArrowUpRightIcon = (props) => (
    <Icon {...props}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></Icon>
);

export const PlusIcon = (props) => (
    <Icon {...props}><path d="M12 5v14" /><path d="M5 12h14" /></Icon>
);

export const XIcon = (props) => (
    <Icon {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>
);

export const ArrowUpDownIcon = (props) => (
    <Icon {...props}>
        <path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
    </Icon>
);

export const ArrowUpIcon = (props) => (
    <Icon {...props}><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></Icon>
);

export const ArrowDownIcon = (props) => (
    <Icon {...props}><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></Icon>
);

export const KeyIcon = (props) => (
    <Icon {...props}>
        <circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" />
    </Icon>
);

export const CheckIcon = (props) => (
    <Icon {...props}><path d="M20 6 9 17l-5-5" /></Icon>
);

export const GearIcon = (props) => (
    <Icon {...props}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </Icon>
);

export const DownloadIcon = (props) => (
    <Icon {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" />
    </Icon>
);

export const SearchIcon = (props) => (
    <Icon {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>
);

export const UploadIcon = (props) => (
    <Icon {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" />
    </Icon>
);

export const TrashIcon = (props) => (
    <Icon {...props}>
        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Icon>
);
