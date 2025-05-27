type AirtableLink = {
    opportunities: string;
    contacts: string;
    accounts: string;
    playbooks: string;
    stageActivityLogs: string;
    stages: string;
    owners: string;
};

export const airtableLinkByAccountId: Record<string, AirtableLink> = {
    // Invest Migrate
    "5b7a773e-6095-4257-aff0-34ba1a99fe24": {
        opportunities:
            "https://airtable.com/apptO7SyBp3gulAof/tblThQHQobAQpKEnP/viwi4kMQI0QHNLOak?blocks=hide",
        contacts:
            "https://airtable.com/apptO7SyBp3gulAof/tblyPisfcCSZTGhP7/viw0fzsMmnPDk2cO6?blocks=hide",
        accounts: "",
        playbooks:
            "https://airtable.com/apptO7SyBp3gulAof/tblNCuRkP9dNnR5W1/viw0cxPHUx2a3aotq?blocks=hide",
        stageActivityLogs:
            "https://airtable.com/apptO7SyBp3gulAof/tblxn7qS1BOim9m3g/viwFnZuHkODqhlM7s?blocks=hide",
        stages:
            "https://airtable.com/apptO7SyBp3gulAof/tblLKTcyiJZwfze6r/viwFEgIkBOvAlVl5C?blocks=hide",
        owners:
            "https://airtable.com/apptO7SyBp3gulAof/tbl0Wlj7rlpw1laTm/viwRQtyY7drWpt6UK?blocks=hide",
    },
    // Edge8
    "cd65c956-5d2d-45d7-aea8-f5e0e29cad8d": {
        opportunities:
            "https://airtable.com/appqom87xbB1h7B94/tbln3I9a8eJETvg2P/viwVNjkgxprVxAf3M?blocks=hide",
        contacts:
            "https://airtable.com/appqom87xbB1h7B94/tbl3pP0gCo2Oivuus/viwejWC7ku2UOKtr1?blocks=hide",
        accounts:
            "https://airtable.com/appqom87xbB1h7B94/tbltla91wWjsNWTpk/viweIcbAyAXL93Mgf?blocks=hide",
        stages:
            "https://airtable.com/appqom87xbB1h7B94/tblvvJ4VsPEdWa8Mc/viwcRYN657yhqSKua?blocks=hide",
        playbooks:
            "https://airtable.com/appqom87xbB1h7B94/tblOWkOUVaPnKoGXX/viwVQyCXuKViZ59rM?blocks=hide",
        stageActivityLogs:
            "https://airtable.com/appqom87xbB1h7B94/tblgk0ShSXDcIPt7L/viw9VAdyawDskxEp0?blocks=hide",
        owners:
            "https://airtable.com/appqom87xbB1h7B94/tbl4MlAldTFFuFSId/viw5BuuwBI7iZOwBf?blocks=hide",
    },
};
