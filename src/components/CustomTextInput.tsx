import React, { FC } from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

interface CustomTextInputProps {
    placeholder?: string;
    label?: string;
    labelStyle?: TextStyle;
    value: string;
    onChangeText: (text: string) => void;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    editable?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
}

const CustomTextInput: FC<CustomTextInputProps> = ({
    placeholder,
    label,
    labelStyle,
    value,
    onChangeText,
    containerStyle,
    textStyle,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    editable = true,
    multiline = false,
    numberOfLines,
}) => {
    const resolvedAutoCapitalize = secureTextEntry ? 'none' : autoCapitalize;

    return (
        <View style={containerStyle}>
            {label && <Text style={labelStyle}>{label}</Text>}
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={resolvedAutoCapitalize}
                placeholderTextColor="#999"
                editable={editable}
                multiline={multiline}
                numberOfLines={numberOfLines}
                style={[
                    textStyle,
                    {
                        width: '100%',
                        borderWidth: 1,
                        borderColor: '#d1d5db',
                        borderRadius: 8,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        backgroundColor: 'white',
                        color: '#333',
                        fontSize: 15,
                    },
                ]}
            />
        </View>
    );
};

export default CustomTextInput;
