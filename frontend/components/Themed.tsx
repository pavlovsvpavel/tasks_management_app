import React from 'react';
import {
    Text as DefaultText,
    View as DefaultView,
    TouchableOpacity as DefaultTouchableOpacity,
    TextProps,
    ViewProps,
    TouchableOpacityProps,
} from 'react-native';

import {Link as DefaultLink, LinkProps} from "expo-router";

type AppTextProps = TextProps & {
    weight?: FontWeight;
};

type FontWeight = 'normal' | 'semibold' | 'bold' | 'light';

export function Text({weight = 'normal', className, ...props}: AppTextProps) {
    const weightToClassMap: Record<FontWeight, string> = {
        normal: 'font-ubuntu-normal',
        bold: 'font-ubuntu-bold',
        semibold: 'font-ubuntu-semibold',
        light: 'font-ubuntu-light',
    };

    const finalClassName = `${weightToClassMap[weight]} ${className || ''}`;

    return <DefaultText className={finalClassName} {...props} />;
}

type AppLinkProps = LinkProps & {
    weight?: FontWeight;
    className?: string;
};

export function Link({
                         href,
                         weight,
                         className,
                         children,
                         ...rest
                     }: AppLinkProps) {
    return (
        <DefaultLink href={href} asChild {...rest}>
            <Text weight={weight} className={className}>
                {children}
            </Text>
        </DefaultLink>
    );
}

export function View(props: ViewProps) {
    return <DefaultView {...props} />;
}

export function TouchableOpacity(props: TouchableOpacityProps) {
    return <DefaultTouchableOpacity {...props} />;
}
