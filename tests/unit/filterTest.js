

describe('FilterTest', function () {
    'use strict';

    var $filter,
        init,
        $httpBackend;

    beforeEach(function () {
        module('NgApp');

        inject(function (_$filter_, $injector) {
            $filter = _$filter_;
            init = new InitialDataForUnitTests();
            $httpBackend = $injector.get('$httpBackend');
        });
    });

    it('filter: dateParser', function () {
        var timestamp = init.timestamp, result;
        var mls = 1000;
        var currDate = new Date(init.timestamp*mls);
        var gmtHours = -currDate.getTimezoneOffset()/60;
        timestamp = (timestamp - gmtHours*60*60)*mls;

        result = $filter('dateParser')(timestamp, 'time');
        expect(result).toEqual('10:33:20');

        result = $filter('dateParser')(timestamp, 'date');
        expect(result).toEqual('29/01/2015');

        result = $filter('dateParser')(timestamp);
        expect(result).toEqual('29/01/2015');
    });

    it('filter: countChannels', function () {
        var statistic = init.posts().results[0].statistic;
        var result = $filter('countChannels')(statistic);
        expect(result).toEqual(2);
    });

    it('filter: relativeDate', function () {
        var date = new Date();
        var day = 1000*60*60*24;
        var timestamp = date.getTime();
        var result = $filter('relativeDate')(date.getTime());
        var periods = [timestamp, timestamp-day, timestamp-3*day, timestamp-8*day, timestamp-33*day, timestamp-5*33*day,
            timestamp-12*33*day, timestamp-23*33*day, timestamp + day, timestamp+3*day, timestamp+8*day,
            timestamp+33*day, timestamp+5*33*day, timestamp+12*33*day, timestamp+23*33*day];
        var periodsValue = [
            '@:TODAY',//'today'
            'yesterday',
            '{{time}} days ago',//3
            'a week ago',
            'a month ago',
            '{{time}} months ago',//5
            'a year ago',
            'over a year ago',
            'tomorrow',
            '{{time}} days from now',//2
            'a week from now',
            'a month from now',
            '{{time}} months from now',//5
            'a year from now',
            'over a year from now'];
        var translation = readJSON('json/en-us.json');
        $.map(periods, function (elem, i) {
            expect(translation[$filter('relativeDate')(elem)]).toBe(periodsValue[i]);
        });
    });

    it('filter: parserHtml', function () {
        var parserHtml = init.parserHtml().html;
        var result = $filter('parserHtml')(parserHtml);
        expect(result).toEqual(init.parserHtml().text);
    });

    it('filter: exchangePreviewPost', function () {
        var parserHtml = init.parserHtml().html;
        var result = $filter('exchangePreviewPost')(parserHtml);
        expect(result).toEqual(init.parserHtml().text);
    });

    it('filter: exchangePreviewPost (isSubject)', function () {
        var parserHtml = init.parserHtml().html;
        var subjectField = init.parserHtml().subject;
        var result = $filter('exchangePreviewPost')(parserHtml, subjectField);
        expect(result).toEqual(subjectField);
    });
});