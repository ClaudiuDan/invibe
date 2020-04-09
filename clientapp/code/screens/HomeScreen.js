import * as React from 'react';
import { Button, View } from "react-native";

export function HomeScreen({navigation}) {
    return (
      <View>
        <Button
          title="Go to Profile"
          onPress={() => navigation.navigate('Profile')}
        />
        <Button
          title="Go to Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <Button
          title="Go to Chats"
          onPress={() => navigation.navigate('Chats')}
        />
      </View>
    );
  }

  // const styles = StyleSheet.create({
  //   container: {
  //     flex: 1,
  //     backgroundColor: '#fff',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //   },
  // });
