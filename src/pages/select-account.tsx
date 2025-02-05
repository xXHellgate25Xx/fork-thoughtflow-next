import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useGetAllAccountsQuery } from 'src/libs/service/account/account';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function Page() {
  const [allAccount, setAllAccount] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();
  const handleNavigateToAccount = (account_id: string, account_name: string) => {
    navigate('/', {
      replace: true,
      state: { id: account_id, name: account_name },
    });
  };
  const { data: allAccountsApiData, isFetching } = useGetAllAccountsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const mapAllAccountsApi = (inputs: any[]) =>
    inputs.map((input) => ({
      id: String(input.id),
      name: String(input.name),
    })) || [];

  useEffect(() => {
    if (allAccountsApiData?.data) {
      setAllAccount(mapAllAccountsApi(allAccountsApiData.data));
    }
  }, [allAccountsApiData]);

  const handleOnClickAccount = (account_id: string, account_name: string) => {
    // Set account ID and navigate
    localStorage.setItem('accountId', account_id);
    localStorage.setItem('accountName', account_name);
    handleNavigateToAccount(account_id, account_name);
    window.location.reload();
  };
  return (
    <>
      <Helmet>
        <title> {`Select account - ${CONFIG.appName}`}</title>
      </Helmet>

      <Typography variant="h4">Select an account</Typography>

      <Box display="flex" flexDirection="column" gap="1rem" mt="1rem">
        {isFetching
          ? <Box display="flex" justifyContent="center" alignItems="center" width="100%">
              <CircularProgress size={34} />
            </Box>
          : allAccount.map((account) => (
              <Button
                size="large"
                variant="outlined"
                color="inherit"
                onClick={() => handleOnClickAccount(account.id, account.name)}
                endIcon={<Icon icon="weui:arrow-filled" width="1rem" />}
              >
                {account.name}
              </Button>
            ))}
      </Box>
    </>
  );
}
