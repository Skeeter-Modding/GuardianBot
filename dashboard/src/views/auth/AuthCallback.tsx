import { useEffect } from 'react';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export function AuthCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    
    if (token) {
      // Store the token and redirect to dashboard
      localStorage.setItem('discord-token', token);
      window.location.href = '/';
    } else if (error) {
      // Handle authentication error
      alert('Authentication failed. Please try again.');
      window.location.href = '/';
    } else {
      // No token or error, redirect back to login
      window.location.href = '/';
    }
  }, []);

  return (
    <Center h="100vh" bg="gray.50">
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" />
        <Text>Processing authentication...</Text>
      </VStack>
    </Center>
  );
}