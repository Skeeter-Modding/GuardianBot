import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Button, Input } from '@chakra-ui/react';
import { BsDiscord } from 'react-icons/bs';
import { Box, Center, Flex, Grid, Heading } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useColors } from 'theme';
import { HomeView } from 'views/home/HomeView';
import CloudSvg from 'assets/Cloud.svg';
import { bot } from 'api/bot';
import { auth } from 'config/translations/auth';

export function LoginView() {
  const t = auth.useTranslations();
  
  const handleMockLogin = () => {
    // For development, bypass Discord OAuth and set a mock token
    console.log('Mock login button clicked');
    
    // Store in both formats for compatibility
    localStorage.setItem('discord-token', 'mock-discord-token-12345');
    localStorage.setItem('ios-session-token', 'mock-discord-token-12345');
    
    console.log('Token stored in both formats, redirecting...');
    
    // Force reload to trigger authentication check
    window.location.reload();
  };

  const handleDiscordLogin = () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_DISCORD_REDIRECT_URI || 'http://localhost:5173/api/auth/redirect');
    const scope = encodeURIComponent('identify guilds');
    
    console.log('Discord login clicked', { clientId, redirectUri });
    
    if (clientId && clientId !== 'YOUR_DISCORD_CLIENT_ID_HERE') {
      // Real Discord OAuth2 - redirect to API server login endpoint
      const authUrl = `http://localhost:3001/api/auth/login`;
      console.log('Redirecting to API auth:', authUrl);
      window.location.href = authUrl;
    } else {
      // Fallback to mock login if not configured
      console.log('No Discord config, falling back to mock');
      handleMockLogin();
    }
  };

  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
  const hasDiscordConfig = import.meta.env.VITE_DISCORD_CLIENT_ID && 
                          import.meta.env.VITE_DISCORD_CLIENT_ID !== 'YOUR_DISCORD_CLIENT_ID_HERE';

  return (
    <AuthLayout>
      <FormControl>
        <FormLabel children="Login to GuardianBot Dashboard" />
        
        {hasDiscordConfig ? (
          <Button 
            leftIcon={<BsDiscord />} 
            children="Login with Discord"
            onClick={handleDiscordLogin}
            colorScheme="blue"
            mb={3}
          />
        ) : (
          <Button 
            leftIcon={<BsDiscord />} 
            children="Login with Discord (Mock)"
            onClick={handleMockLogin}
            colorScheme="blue"
            mb={3}
          />
        )}
        
        {isDevMode && hasDiscordConfig && (
          <Button 
            leftIcon={<BsDiscord />} 
            children="Login with Mock (Dev)"
            onClick={handleMockLogin}
            colorScheme="gray"
            size="sm"
            mb={2}
          />
        )}
        
        <Button 
          children="Quick Mock Login (Test)"
          onClick={handleMockLogin}
          colorScheme="green"
          size="sm"
          mb={2}
        />
      </FormControl>
    </AuthLayout>
  );
}

function AuthLayout({ children }: { children: ReactNode }) {
  const t = auth.useTranslations();
  const { globalBg, brand } = useColors();

  return (
    <Grid
      position="relative"
      templateColumns={{ base: '1fr', lg: '1fr 1fr', xl: '1fr 1.2fr' }}
      h="full"
    >
      <Center
        pos="relative"
        bg={brand}
        bgImg={CloudSvg}
        bgRepeat="no-repeat"
        bgPosition="bottom"
        flexDirection="column"
        gap={4}
        py={10}
      >
        <Heading color="white" fontSize="8xl" children={t.login} />
        <Box pos="relative" p={10} bg={globalBg} rounded="lg">
          {children}
        </Box>
      </Center>
      <Flex direction="column" bg={globalBg} p={30}>
        <HomeView />
      </Flex>
    </Grid>
  );
}
