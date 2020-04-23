
import * as Facebook from 'expo-facebook';

export const handleFacebookSocialRequest = async (func) => {
    try {
      await Facebook.initializeAsync('530323767560533');
      const {
        // type cancel/success,
        // expires is the lifetime of the token (this is a problem)
        type,
        token,
        expires
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile', 'email'],
      });
      if (type === 'success') {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
        func(token);
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
};



export const func = () => {
    
};

