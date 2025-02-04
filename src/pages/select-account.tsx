import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { Box, Button, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useGetAllAccountsQuery } from 'src/libs/service/account/account';
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------

export default function Page() {
  const accounts = [
    { id: '1', name: 'Account 1' },
    { id: '2', name: 'Account 2' },
    { id: '3', name: 'Account 3' }
  ]

  const [allAccount, setAllAccount] = useState<{ id: string; name: string; }[]>([]);
  const navigate = useNavigate();
  const handleNavigateToAccount = (account_id:string, account_name:string) => {
    navigate("/", {
      replace: true,
      state: { id:account_id, name:account_name },
    });
  };
  const allAccountsApiData = useGetAllAccountsQuery();
  const mapAllAccountsApi = (inputs: any[]) =>
    inputs.map((input) => ({
      id: String(input.id),
      name: String(input.name),
    })) || [];
  useEffect(() => {
    if (allAccountsApiData?.data?.data) {
      setAllAccount(mapAllAccountsApi(allAccountsApiData.data.data));
    }
  }, [allAccountsApiData]);

  useEffect(() => {
    // Refetch all queries when the page loads
    allAccountsApiData.refetch();
  }, []);

  const handleOnClickAccount = (account_id:string, account_name:string) => {
    // Clear existing data immediately
    setAllAccount([]);
    // Set account ID and navigate
    localStorage.setItem("accountId", account_id);
    localStorage.setItem("accountName", account_name);
    handleNavigateToAccount(account_id, account_name);
  }
  return (
    <>
      <Helmet>
        <title> {`Select account - ${CONFIG.appName}`}</title>
      </Helmet>

      <Typography variant="h4">Select an account</Typography>

      <Box display="flex" flexDirection="column" gap='1rem' mt='1rem'>
        {allAccount.map((account) => (
          <Button
            size='large'
            variant='outlined'
            color='inherit'
            onClick={() => handleOnClickAccount(account.id, account.name)}
            endIcon={<Icon icon='weui:arrow-filled' width='1rem'/>}
          >{account.name}
          </Button>
        ))}
      </Box>
    </>
  );
}
