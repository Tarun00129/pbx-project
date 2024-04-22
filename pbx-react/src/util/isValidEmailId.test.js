import {
    test,
    expect,
} from '@jest/globals';
import isValidEmailId from './isValidEmailId.js';

test('emails are valid from domain list', () => {

    const domains = [
        'airport.aero',
        'ebay.auction',
        'myblog.blog',
        'stclair.college',
        'realestate.associates',
        'spotify.audio',
        'school.academy',
        'marketing.agency',
        'windsor.apartments',
        'organization.international',
        'retailer.market',
        'realestate.properties',
        'station.radio',
        'business.technology',
    ];

    expect(isValidEmailId('meredith@airport.aero', domains)).toBe(true);
    expect(isValidEmailId('meredith@ebay.auction', domains)).toBe(true);
    expect(isValidEmailId('meredith@myblog.blog', domains)).toBe(true);
    expect(isValidEmailId('meredith@stclair.college', domains)).toBe(true);
    expect(isValidEmailId('meredith@realestate.associates', domains)).toBe(true);
    expect(isValidEmailId('meredith@spotify.audio', domains)).toBe(true);
    expect(isValidEmailId('meredith@school.academy', domains)).toBe(true);
    expect(isValidEmailId('meredith@marketing.agency', domains)).toBe(true);
    expect(isValidEmailId('meredith@windsor.apartments', domains)).toBe(true);
    expect(isValidEmailId('meredith@organization.international', domains)).toBe(true);
    expect(isValidEmailId('meredith@retailer.market', domains)).toBe(true);
    expect(isValidEmailId('meredith@realestate.properties', domains)).toBe(true);
    expect(isValidEmailId('meredith@station.radio', domains)).toBe(true);
    expect(isValidEmailId('meredith@business.technology', domains)).toBe(true);

    expect(isValidEmailId('akshay@crenspire.com', domains)).toBe(false); // not in domain list.
    expect(isValidEmailId(123)).toBe(false);
    expect(isValidEmailId('abc')).toBe(false);
    expect(isValidEmailId('')).toBe(false);
    expect(isValidEmailId(null)).toBe(false);
    expect(isValidEmailId('not-email')).toBe(false);
    expect(isValidEmailId('notemail.com')).toBe(false);
    expect(isValidEmailId('notemail@')).toBe(false);

});
