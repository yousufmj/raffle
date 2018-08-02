import * as magazineController from '../../src/controllers/magazineController';
import iconv from 'iconv-lite';
import encodings from 'iconv-lite/encodings';
iconv.encodings = encodings;

describe('/magazine', () => {

    test('GET /listAll - List all magazines', () => {

        let mockedResponse = {
            success: true,
            results: [{
                id: 1,
                Name: 'test',
                website: 'test.com'
            }]
        };

        let spy = jest
            .spyOn(magazineController,'listMagazines')
            .mockReturnValue(mockedResponse);

        let listAll = magazineController.listMagazines();

        expect(spy).toHaveBeenCalled();
        expect(listAll.success).toBe(true);

        spy.mockReset();
        spy.mockRestore();

    });

    test('POST /create - Create New magazine', () => {

        let mockedResponse = {
            success: true,
            message: 'Successfully created new entry',
            id: 1
        };

        let spy = jest
            .spyOn(magazineController,'createMagazine')
            .mockReturnValue(mockedResponse);

        let create = magazineController.createMagazine();

        expect(spy).toHaveBeenCalled();
        expect(create.success).toBe(true);

        spy.mockReset();
        spy.mockRestore();

    });

    test('PATCH /:id - Update a magazine', () => {

        let mockedResponse = {
            success: true,
            message: 'Successfully updated'
        };

        let spy = jest
            .spyOn(magazineController,'updateMagazine')
            .mockReturnValue(mockedResponse);

        let update = magazineController.updateMagazine();

        expect(spy).toHaveBeenCalled();
        expect(update.success).toBe(true);

        spy.mockReset();
        spy.mockRestore();

    });

    test('DELETE /:id - Delete a magazine', () => {

        let mockedResponse = {
            success: true,
            message: 'Successfully deleted'
        };

        let spy = jest
            .spyOn(magazineController,'deleteMagazine')
            .mockReturnValue(mockedResponse);

        let deleteMag = magazineController.deleteMagazine();

        expect(spy).toHaveBeenCalled();
        expect(deleteMag.success).toBe(true);

        spy.mockReset();
        spy.mockRestore();

    });

    test('GET /:id - Find specific magazine', () => {

        let mockedResponse = {
            success: true,
            results: {
                id: 1,
                Name: 'test',
                Website: 'test.com',
                created_at: '2018-03-22T16:56:51.000Z',
                updated_at: '2018-03-26T10:21:01.000Z'
            }
        };

        let spy = jest
            .spyOn(magazineController,'getMagazine')
            .mockReturnValue(mockedResponse);

        let getMagazine = magazineController.getMagazine();

        expect(spy).toHaveBeenCalled();
        expect(getMagazine.success).toBe(true);

        spy.mockReset();
        spy.mockRestore();

    });

});