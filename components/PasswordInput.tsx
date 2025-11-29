import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY = "#390492";

type PasswordInputProps = TextInputProps & {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
};

const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  ({ placeholder, value, onChangeText, onSubmitEditing, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View style={styles.inputContainer}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={PRIMARY}
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          keyboardType="numeric"
          maxLength={6}
          {...rest}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.icon}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color={PRIMARY}
          />
        </TouchableOpacity>
      </View>
    );
  }
);

export default PasswordInput;

const styles = StyleSheet.create({
  inputContainer: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    paddingVertical: 14,
    marginBottom: 25,
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: PRIMARY,
    paddingRight: 40, 
  },
  icon: {
    position: "absolute",
    right: 0,
    bottom: 35,
  },
});
