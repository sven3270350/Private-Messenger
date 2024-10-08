import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function PhoneIcon(props) {
  return (
    <Svg width={33} height={33} viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M9.078 5.833h5.49l2.746 6.863-3.432 2.059a15.098 15.098 0 006.863 6.863l2.059-3.432 6.863 2.745v5.49a2.745 2.745 0 01-2.745 2.746A21.961 21.961 0 016.333 8.578a2.745 2.745 0 012.745-2.745"
        stroke="#888"
        {...props}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export { PhoneIcon };
