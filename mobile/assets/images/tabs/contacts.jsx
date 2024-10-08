import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function ContactsIcon(props) {
  return (
    <Svg width={33} height={33} viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M17.951 17.549a6.222 6.222 0 100-12.445 6.222 6.222 0 000 12.445zm0 0c-6.013 0-10.889 4.875-10.889 10.889m10.89-10.89c6.013 0 10.888 4.876 10.888 10.89"
        stroke="#888"
        {...props}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export { ContactsIcon };
