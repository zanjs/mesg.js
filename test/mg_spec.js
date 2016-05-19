describe('initialization', function () {

    it('should create a new instance', function () {
        expect(window.Mesg !== undefined).toBeTruthy();
    });

    it('isSupported should return a boolean', function () {
        expect(typeof Mesg.isSupported).toBe('boolean');
    });

});

describe('permission', function () {

    var callback, // Empty callback
        noop; // No operator (empty function)

    beforeEach(function () {
        callback = jasmine.createSpy('callback');
        noop = function () {};
    });

    it('should have permission stored as a string constant', function () {
        expect(typeof Mesg.Permission.get()).toBe('string');
    });

    it('should update permission value if permission is denied and execute callback', function (done) {

        spyOn(window.Notification, 'requestPermission').and.callFake(function (cb) {
            cb(Mesg.Permission.DENIED);
        });

        Mesg.Permission.request(noop, callback);

        setTimeout(function () {
            expect(Mesg.Permission.has()).toBe(false);
            expect(callback).toHaveBeenCalled();
            done();
        }, 500);
    });

    it('should request permission if permission is not granted', function () {

        spyOn(window.Notification, 'requestPermission').and.callFake(function (cb) {
            cb(Mesg.Permission.DENIED);
        });

        Mesg.Permission.request();

        Mesg.create('hello world!');

        expect(window.Notification.requestPermission).toHaveBeenCalled();
    });


    it('should update permission value if permission is granted and execute callback', function (done) {

        spyOn(window.Notification, 'requestPermission').and.callFake(function (cb) {
            cb(Mesg.Permission.GRANTED);
        });

        Mesg.Permission.request(callback, noop);

        setTimeout(function () {
            expect(Mesg.Permission.has()).toBe(true);
            expect(callback).toHaveBeenCalled();
            done();
        }, 500);
    });

});

describe('creating notifications', function () {

    var callback;

    beforeAll(function () {

        jasmine.clock().install();

        spyOn(window.Notification, 'requestPermission').and.callFake(function (cb) {
            cb(Mesg.Permission.GRANTED);
        });
    });

    beforeEach(function () {
        callback = jasmine.createSpy('callback');
    });


    it('should throw exception if no title is provided', function () {
        expect(function() {
            Mesg.create();
        }).toThrow();
    });

    it('should return wrapper successfully', function () {

        var wrapper = Mesg.create('hello world');

        expect(wrapper.close).not.toBe(undefined);
        expect(wrapper.close.constructor).toBe(Function);

    });

    it('should return the correct notification count', function () {

        var count;

        count = Mesg.count;

        Mesg.create('hello world!');

        expect(Mesg.count).toBe(count + 1);

    });

});

describe('closing notifications', function () {

    it('should close notifications if a timeout is specified', function () {

        spyOn(window.Notification, 'requestPermission').and.callFake(function (cb) {
            cb(Mesg.Permission.GRANTED);
        });

        spyOn(window.Notification.prototype, 'close');

        Mesg.create('hello world!', {
            timeout: 1000
        });

        expect(window.Notification.prototype.close).not.toHaveBeenCalled();

        jasmine.clock().tick(1000);

        expect(window.Notification.prototype.close).toHaveBeenCalled();

    });

    it('should close a notification given a tag', function () {

        var count;

        spyOn(window.Notification.prototype, 'close');

        Mesg.create('hello world!', {
            tag: 'foo'
        });

        count = Mesg.count;

        Mesg.close('foo');

        expect(window.Notification.prototype.close).toHaveBeenCalled();
        expect(Mesg.count).toBe(count - 1);

    });

    it('should close all notifications when cleared', function () {

        spyOn(window.Notification.prototype, 'close');

        Mesg.create('hello world!', {
            tag: 'foo'
        });

        expect(Mesg.count).toBeGreaterThan(0);

        Mesg.clear();

        expect(window.Notification.prototype.close).toHaveBeenCalled();
        expect(Mesg.count).toBe(0);

    });
});
