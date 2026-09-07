import { IS_PUBLIC_KEY, Public } from './public.decorator';

@Public()
class PublicClass {
  @Public()
  getHealth() {
    return 'ok';
  }
}

describe('Public', () => {
  it('stores public-route metadata on a class', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, PublicClass)).toBe(true);
  });

  it('stores public-route metadata on a method', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, PublicClass.prototype.getHealth)).toBe(
      true,
    );
  });
});