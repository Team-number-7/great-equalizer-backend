// eslint-disable-next-line import/no-named-as-default
import { Document, ObjectId, WithId } from 'mongodb';
import passwordComparison from './authentication';

describe('authentication', () => {
  describe('password comparison', () => {
    test('happy path', () => {
      // Arrange
      const expectedPassword = 'strongpassword123';
      const expectedUserPassword = 'strongpassword123';
      const expectedUsername = 'andryiuha';
      const expectedHash: Buffer = Buffer.from(expectedPassword);
      const expectedId = new ObjectId(8);
      const expectedUser: WithId<Document> = {
        username: expectedUsername,
        password: expectedUserPassword,
        _id: expectedId,
      };
      const expectedComparisonResult = expectedUser;

      // Act
      const actualComparisonResult = passwordComparison(expectedUser, expectedHash);

      // Assert
      expect(actualComparisonResult).toEqual(expectedComparisonResult);
    });

    // test('unhappy path', () => {
    //   // Arrange
    //   const expectedPassword = 'strongpassword123';
    //   const expectedUserPassword = 'strongpassword124';
    //   const expectedHash: Buffer = Buffer.from(expectedPassword);
    //   const expectedRow: Buffer = Buffer.from(expectedUserPassword);
    //   const expectedErrorMessage = { message: 'Incorrect username or password.' };
    //   const expectedComparisonResult = expectedErrorMessage;
    //
    //   // Act
    //   const actualComparisonResult = passwordComparison(expectedRow, expectedHash);
    //
    //   // Assert
    //   expect(actualComparisonResult).toEqual(expectedComparisonResult);
    // });
  });
  // test('happy path', () => {
  //   // Arrange
  //   const expectedUsername = 'vladislavs';
  //   const expectedPassword = 'strongpassword123';
  //   const expectedError = null;
  //   const expectedData = {
  //     username: expectedUsername,
  //     password: expectedPassword,
  //   };
  //
  //   // Act
  //   const actualVerification = verify(expectedUsername, expectedPassword, mockCb);
  //
  //   // Assert
  //   expect(actualVerification).toEqual(expectedVerification);
  //   expect(mockCb).toBeCalledWith(expectedError, expectedData);
  //   expect(mockCrypto).toBeCalledWith();
  // });
});
